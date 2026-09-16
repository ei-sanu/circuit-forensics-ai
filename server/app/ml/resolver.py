"""Multi-Signal Entity Resolution and Deduplication Engine.
Combines exact identifier matching, token n-gram edit distance, phonetic Soundex encoding,
graph neighborhood overlap (Jaccard), and structured attribute correlation.
"""
import re
import difflib
from typing import List, Optional, Set, Tuple, Dict, Any
from app.ml.schemas import EntityCandidate, MatchResult, TargetEntity


def _clean_str(s: str) -> str:
    return " ".join(s.lower().strip().split())


def _normalize_identifier(s: str) -> str:
    """Strip spaces, dashes, dots, and convert to upper-case for canonical ID comparison."""
    return re.sub(r"[\s\-\.\(\)\+]", "", s).upper()


def soundex(s: str) -> str:
    """Computes American/Indian Soundex phonetic representation for criminal alias matching."""
    cleaned = re.sub(r"[^A-Za-z]", "", s).upper()
    if not cleaned:
        return "0000"
    first_letter = cleaned[0]
    mapping = {
        "B": "1", "F": "1", "P": "1", "V": "1",
        "C": "2", "G": "2", "J": "2", "K": "2", "Q": "2", "S": "2", "X": "2", "Z": "2",
        "D": "3", "T": "3",
        "L": "4",
        "M": "5", "N": "5",
        "R": "6"
    }
    encoded = []
    prev = mapping.get(first_letter, "0")
    for char in cleaned[1:]:
        code = mapping.get(char, "0")
        if code != "0" and code != prev:
            encoded.append(code)
        prev = code
    return (first_letter + "".join(encoded) + "000")[:4]


def _phonetic_similarity(a: str, b: str) -> float:
    """Token-wise phonetic Soundex comparison for compound Indian and international names."""
    ta = [w for w in re.findall(r"[A-Za-z]+", a) if len(w) > 1]
    tb = [w for w in re.findall(r"[A-Za-z]+", b) if len(w) > 1]
    if not ta or not tb:
        return 0.0

    scores = []
    for w1 in ta:
        sx1 = soundex(w1)
        best = 0.0
        for w2 in tb:
            sx2 = soundex(w2)
            if sx1 == sx2:
                best = 1.0
                break
            else:
                ratio = difflib.SequenceMatcher(None, sx1, sx2).ratio()
                if ratio > best:
                    best = ratio
        scores.append(best)
    return sum(scores) / len(scores) if scores else 0.0


def _token_similarity(a: str, b: str) -> float:
    """Calculates n-gram token and sequence similarity."""
    ca = _clean_str(a)
    cb = _clean_str(b)
    if not ca or not cb:
        return 0.0
    seq_ratio = difflib.SequenceMatcher(None, ca, cb).ratio()
    ta = ca.split()
    tb = cb.split()
    if not ta or not tb:
        return seq_ratio

    # Pairwise token similarity for typos & out-of-order words
    token_scores = []
    for w1 in ta:
        best_w = max((difflib.SequenceMatcher(None, w1, w2).ratio() for w2 in tb), default=0.0)
        token_scores.append(best_w)
    avg_token_score = sum(token_scores) / len(token_scores) if token_scores else 0.0
    return max(seq_ratio, avg_token_score, 0.7 * seq_ratio + 0.3 * avg_token_score)


def _graph_neighborhood_similarity(target_attrs: Dict[str, Any], cand_attrs: Dict[str, Any]) -> float:
    """Computes Jaccard similarity of co-occurring entities or case memberships."""
    t_neighbors = set(target_attrs.get("neighbors") or target_attrs.get("co_entities") or target_attrs.get("cases") or [])
    c_neighbors = set(cand_attrs.get("neighbors") or cand_attrs.get("co_entities") or cand_attrs.get("cases") or [])
    if not t_neighbors or not c_neighbors:
        return 0.0
    intersection = t_neighbors.intersection(c_neighbors)
    union = t_neighbors.union(c_neighbors)
    return len(intersection) / float(len(union)) if union else 0.0


class EntityResolver:
    """
    Multi-Signal Entity Resolver:
    Combines:
      - S_exact: Exact PAN / Aadhaar / Phone / Vehicle match (1.0)
      - S_token: String and token edit distance (weight 0.40)
      - S_phonetic: Soundex phonetic similarity (weight 0.25)
      - S_graph: Shared network neighborhood Jaccard coefficient (weight 0.20)
      - S_attr: Categorical attribute overlap (weight 0.15)
    """

    def resolve(
        self,
        target: TargetEntity,
        candidates: List[EntityCandidate],
        threshold: float = 0.75
    ) -> MatchResult:
        # Filter candidates by the same entity type
        type_candidates = [c for c in candidates if c.type == target.type]
        if not type_candidates:
            return MatchResult(
                matched_id=None,
                confidence=0.0,
                decision="new_candidate",
                similarity_score=0.0,
                reasoning=f"No existing canonical records found for entity type '{target.type}'."
            )

        norm_target_id = _normalize_identifier(target.label)

        # 1. Exact match on normalized identifier for Phones, Vehicles, Accounts, PAN, Aadhaar
        if target.type in ("phone", "vehicle", "account", "pan", "aadhaar"):
            for c in type_candidates:
                cand_ids = [_normalize_identifier(c.name)] + [_normalize_identifier(al) for al in c.aliases]
                # Check for phone last-10-digits equivalence
                if target.type == "phone":
                    t_digits = re.sub(r"\D", "", target.label)[-10:]
                    if any(re.sub(r"\D", "", cid)[-10:] == t_digits for cid in cand_ids if len(re.sub(r"\D", "", cid)) >= 10):
                        return MatchResult(
                            matched_id=c.id,
                            confidence=0.99,
                            decision="match",
                            similarity_score=1.0,
                            reasoning=f"Exact 10-digit phone identifier match with canonical record '{c.name}' ({c.id})."
                        )
                if norm_target_id in cand_ids:
                    return MatchResult(
                        matched_id=c.id,
                        confidence=0.99,
                        decision="match",
                        similarity_score=1.0,
                        reasoning=f"Exact identifier match ({norm_target_id}) with canonical record '{c.name}' ({c.id})."
                    )

        # 2. Multi-Signal Scoring for Persons and Organizations
        best_candidate: Optional[EntityCandidate] = None
        best_score: float = 0.0
        best_breakdown: Dict[str, float] = {}
        best_reason: str = ""
        is_alias_match: bool = False

        # Multi-signal weights (sum to 1.0)
        W_TOKEN = 0.40
        W_PHONETIC = 0.25
        W_GRAPH = 0.20
        W_ATTR = 0.15

        for c in type_candidates:
            # S_token
            name_token_s = _token_similarity(target.label, c.name)
            alias_token_s = max((_token_similarity(target.label, al) for al in c.aliases), default=0.0)
            token_s = max(name_token_s, alias_token_s)
            matched_via_alias = alias_token_s > name_token_s

            # S_phonetic
            name_phonetic_s = _phonetic_similarity(target.label, c.name)
            alias_phonetic_s = max((_phonetic_similarity(target.label, al) for al in c.aliases), default=0.0)
            phonetic_s = max(name_phonetic_s, alias_phonetic_s)

            # S_graph
            graph_s = _graph_neighborhood_similarity(target.attributes, c.attributes)

            # S_attr
            attr_matches = 0
            total_attrs = len(target.attributes)
            for k, v in target.attributes.items():
                if k in c.attributes and str(c.attributes[k]).lower() == str(v).lower():
                    attr_matches += 1
            attr_s = (attr_matches / float(total_attrs)) if total_attrs > 0 else 0.0

            # Dynamic weight adjustment if graph or attributes are unpopulated
            effective_w_token = W_TOKEN
            effective_w_phonetic = W_PHONETIC
            effective_w_graph = W_GRAPH if graph_s > 0 else 0.0
            effective_w_attr = W_ATTR if total_attrs > 0 else 0.0
            total_w = effective_w_token + effective_w_phonetic + effective_w_graph + effective_w_attr

            composite_score = (
                (effective_w_token * token_s) +
                (effective_w_phonetic * phonetic_s) +
                (effective_w_graph * graph_s) +
                (effective_w_attr * attr_s)
            ) / total_w

            composite_score = round(min(1.0, max(0.0, composite_score)), 3)

            if composite_score > best_score:
                best_score = composite_score
                best_candidate = c
                is_alias_match = matched_via_alias
                best_breakdown = {
                    "token": round(token_s, 3),
                    "phonetic": round(phonetic_s, 3),
                    "graph": round(graph_s, 3),
                    "attribute": round(attr_s, 3)
                }
                alias_note = f" (via alias match)" if matched_via_alias else ""
                best_reason = (
                    f"Multi-signal match with '{c.name}' ({c.id}){alias_note}. "
                    f"Signals: Token={token_s:.2f} (w={effective_w_token/total_w:.2f}), "
                    f"Phonetic={phonetic_s:.2f} (w={effective_w_phonetic/total_w:.2f}), "
                    f"Graph={graph_s:.2f} (w={effective_w_graph/total_w:.2f}), "
                    f"Attr={attr_s:.2f} (w={effective_w_attr/total_w:.2f})."
                )

        # Determine decision outcome
        if best_score >= threshold and best_candidate:
            decision = "alias" if is_alias_match else "match"
            return MatchResult(
                matched_id=best_candidate.id,
                confidence=best_score,
                decision=decision,
                similarity_score=best_score,
                reasoning=best_reason
            )
        else:
            return MatchResult(
                matched_id=None,
                confidence=best_score,
                decision="new_candidate",
                similarity_score=best_score,
                reasoning=(
                    f"Highest multi-signal score ({best_score:.2f}) with "
                    f"'{best_candidate.name if best_candidate else 'none'}' is below deduplication threshold ({threshold:.2f}). "
                    f"Identified as new sovereign entity candidate."
                )
            )
