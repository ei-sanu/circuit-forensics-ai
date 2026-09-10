"""Entity Resolution and Deduplication Engine."""
import difflib
from typing import List, Optional
from app.schemas.resolve import EntityCandidate, MatchResult, TargetEntity


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
                        reasoning=f"Exact match on {target.type} identifier: {c.name}"
                    )

        # 2. Check Aliases
        best_alias_match: Optional[EntityCandidate] = None
        best_alias_score = 0.0
        best_alias_name = ""

        for c in type_candidates:
            for alias in c.aliases:
                score = _token_similarity(target.label, alias)
                if score > best_alias_score:
                    best_alias_score = score
                    best_alias_match = c
                    best_alias_name = alias

        if best_alias_match and best_alias_score >= 0.88:
            return MatchResult(
                matched_id=best_alias_match.id,
                confidence=round(best_alias_score, 2),
                decision="alias",
                similarity_score=round(best_alias_score, 2),
                reasoning=f"Matches known alias '{best_alias_name}' of canonical entity {best_alias_match.name} ({best_alias_match.id})"
            )

        # 3. Fuzzy Name & Token Matching
        best_candidate: Optional[EntityCandidate] = None
        best_score = 0.0

        for c in type_candidates:
            score = _token_similarity(target.label, c.name)
            if score > best_score:
                best_score = score
                best_candidate = c

        if best_candidate and best_score >= threshold:
            decision = "match" if best_score >= 0.90 else "match_probable"
            return MatchResult(
                matched_id=best_candidate.id,
                confidence=round(best_score, 2),
                decision=decision,
                similarity_score=round(best_score, 2),
                reasoning=f"Fuzzy token similarity {best_score:.2f} with '{best_candidate.name}' ({best_candidate.id})"
            )

        return MatchResult(
            matched_id=None,
            confidence=round(1.0 - best_score, 2),
            decision="new_candidate",
            similarity_score=round(best_score, 2),
            reasoning=f"Highest similarity ({best_score:.2f}) below threshold ({threshold:.2f}). Identified as a new entity."
        )
