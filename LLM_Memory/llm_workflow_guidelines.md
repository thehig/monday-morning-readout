# LLM Workflow Guidelines (Task Master Integration)

This document outlines the standard workflow for LLM assistants working on tasks within this project, integrating Task Master for planning/state and `LLM_Memory` for procedural knowledge.

**Core Principle:** Task Master (`tasks.json`) is the source of truth for _what_ needs to be done and its _status_. `LLM_Memory/` is the source of truth for _how_ to do specific types of tasks or apply established patterns.

**Workflow:**

1.  **Understand Request & Consult Memory:**

    - Analyze the user's request.
    - **Consult LLM Memory:** Check the `LLM_Memory/` directory for files containing relevant procedures, patterns, or guidelines (e.g., `testing_supabase_with_msw.md`). Note which files are relevant.
    - _(Self-Correction: Ensure you have also read this `llm_workflow_guidelines.md` file.)_

2.  **Assess Complexity & Plan with Task Master (If Needed):**

    - If the request is simple and maps directly to an existing Task Master task, proceed to Step 3.
    - If the request is complex, multi-stage, or not represented in Task Master:
      - **Plan:** Use Task Master tools (`add_task`, `expand_task`) to break the request down into logical, actionable tasks and subtasks within `tasks.json`.
      - **Reference Memory:** In the `details` of newly created tasks/subtasks, reference relevant `LLM_Memory/` files where appropriate (e.g., "Implement using the pattern in `LLM_Memory/testing_supabase_with_msw.md`").

3.  **Identify & Prepare Current Task:**

    - Use `mcp_taskmaster_ai_next_task` to identify the next available task based on dependencies and status.
    - Use `mcp_taskmaster_ai_get_task` with the identified task ID to retrieve its full details.
    - Review the task details and any referenced `LLM_Memory/` files to understand the specific requirements and _how_ to approach the implementation.

4.  **Execute Task & Log Progress:**

    - Set the task status to `in-progress` using `mcp_taskmaster_ai_set_task_status`.
    - Perform the required coding, testing, or documentation work.
    - **Log Findings:** Regularly use `mcp_taskmaster_ai_update_subtask` (for subtasks) or `mcp_taskmaster_ai_update_task` (for top-level tasks if no subtasks) to append implementation notes, challenges encountered, solutions found, or decisions made to the task's `details`. This creates a valuable log (Refer to `dev_workflow.mdc` for iterative logging details).
    - Consult relevant `LLM_Memory/` files as needed during implementation.

5.  **Complete & Verify:**

    - Ensure the task is fully implemented according to its requirements.
    - Verify the implementation (e.g., run relevant tests, confirm functionality).

6.  **Mark Task Complete:**

    - Set the task status to `done` using `mcp_taskmaster_ai_set_task_status`.

7.  **Reflect & Improve (Self-Improvement):**

    - Review the completed work. Were any new patterns established or existing ones modified?
    - If applicable, update or create files in `LLM_Memory/` or `.cursor/rules/` to capture these patterns, following `self_improve.mdc`.

8.  **Repeat:** Go back to Step 3 to find the next task.
