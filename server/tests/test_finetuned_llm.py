import pytest
from app.ml.finetuned_llm import finetuned_llm_client
from app.ml.copilot_engine import CopilotEngine
from app.ml.schemas import CopilotQueryRequest, GraphState, EntityNode, GraphEdge

@pytest.mark.asyncio
async def test_finetuned_llm_status():
    status = await finetuned_llm_client.get_status()
    assert "model_name" in status
    assert status["training_samples_count"] > 0
    assert "supported_tasks" in status
    assert "checkpoint_available" in status

@pytest.mark.asyncio
async def test_copilot_engine_with_rag():
    engine = CopilotEngine()
    g_state = GraphState(
        nodes=[
            EntityNode(id="P-0001", label="Rajesh Verma", entity_type="person"),
            EntityNode(id="ACC-0001", label="Mule Account 1", entity_type="bank_account"),
        ],
        edges=[
            GraphEdge(source="P-0001", target="ACC-0001", rel_type="CONTROLS", weight=1.0)
        ]
    )
    req = CopilotQueryRequest(query="Who is the primary suspect?", graph=g_state)
    res = await engine.answer_query(req)
    assert res.intent in ["influence_ranking", "general_inquiry", "case_summary"]
    assert len(res.direct_facts) > 0
    assert len(res.citations) > 0
