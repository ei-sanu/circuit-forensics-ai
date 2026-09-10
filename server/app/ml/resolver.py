"""Entity Resolution and Deduplication Engine."""
import difflib
from typing import List, Optional
from app.ml.schemas import EntityCandidate, MatchResult, TargetEntity


def _clean_str(s: str) -> str:
    return " ".join(s.lower().strip().split())


def _token_similarity(a: str, b: str) -> float:
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


class EntityResolver:
    """Resolves extracted target entities against existing canonical records."""

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
                reasoning=f"No existing records found for entity type '{target.type}'."
            )

        target_label = _clean_str(target.label)

        # 1. Exact match on normalized identifier for Phones and Vehicles
        if target.type in ("phone", "vehicle"):
            for c in type_candidates:
                if _clean_str(c.name) == target_label or any(_clean_str(al) == target_label for al in c.aliases):
                    return MatchResult(
                        matched_id=c.id,
                        confidence=0.99,
                        decision="match",
                        similarity_score=1.0,
                        reasoning=f"Exact identifier match with canonical record '{c.name}' ({c.id})."
                    )

        # 2. String similarity and Alias match
        best_candidate: Optional[EntityCandidate] = None
        best_score: float = 0.0
        best_reason: str = ""
        is_alias_match: bool = False

        for c in type_candidates:
            # Primary name similarity
            name_score = _token_similarity(target.label, c.name)

            # Alias similarity
            alias_score = 0.0
            best_alias = ""
            for al in c.aliases:
                al_s = _token_similarity(target.label, al)
                if al_s > alias_score:
                    alias_score = al_s
                    best_alias = al

            candidate_score = max(name_score, alias_score)

            # Bonus for attribute overlap (e.g. city, organization, vehicle make)
            attr_matches = 0
            for k, v in target.attributes.items():
                if k in c.attributes and str(c.attributes[k]).lower() == str(v).lower():
                    attr_matches += 1
            if attr_matches > 0:
                candidate_score = min(1.0, candidate_score + (0.05 * attr_matches))

            if candidate_score > best_score:
                best_score = candidate_score
                best_candidate = c
                if alias_score > name_score:
                    is_alias_match = True
                    best_reason = f"High similarity ({alias_score:.2f}) with known alias '{best_alias}' of {c.name} ({c.id})."
                else:
                    is_alias_match = False
                    best_reason = f"Token similarity score of {name_score:.2f} with canonical record '{c.name}' ({c.id})."

        # Determine decision outcome
        if best_score >= threshold and best_candidate:
            decision = "alias" if is_alias_match else "match"
            return MatchResult(
                matched_id=best_candidate.id,
                confidence=round(best_score, 3),
                decision=decision,
                similarity_score=round(best_score, 3),
                reasoning=best_reason
            )
        else:
            return MatchResult(
                matched_id=None,
                confidence=round(best_score, 3),
                decision="new_candidate",
                similarity_score=round(best_score, 3),
                reasoning=(
                    f"Highest similarity ({best_score:.2f}) with '{best_candidate.name if best_candidate else 'none'}' "
                    f"is below the deduplication threshold ({threshold:.2f}). Identified as new entity candidate."
                )
            )
