#!/bin/bash

# Delete all tasks from project 51
API_URL="https://uredno.com/graphql"
AUTH_TOKEN="1748040454"
PROJECT_ID="51"

echo "================================================"
echo "Deleting all tasks from Project 51"
echo "================================================"
echo

# Get all task IDs for project 51
TASK_IDS=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "authtoken: $AUTH_TOKEN" \
    -d '{"query":"{ tbltasks { id rel_id } }"}' | \
    jq -r '.data.tbltasks[] | select(.rel_id == "51") | .id')

# Count tasks
TASK_COUNT=$(echo "$TASK_IDS" | wc -l)
echo "Found $TASK_COUNT tasks to delete"
echo

# Delete each task
for task_id in $TASK_IDS; do
    echo "Deleting task ID: $task_id"
    curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -H "authtoken: $AUTH_TOKEN" \
        -d "{\"query\": \"mutation { deleteTbltasks(id: $task_id) }\"}" > /dev/null
done

echo
echo "All tasks deleted from project 51"
echo

# Also delete milestones if you want to start completely fresh
echo "Checking milestones..."
MILESTONE_IDS=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "authtoken: $AUTH_TOKEN" \
    -d '{"query":"{ tblmilestones { id project_id } }"}' | \
    jq -r '.data.tblmilestones[] | select(.project_id == "51") | .id')

if [ -n "$MILESTONE_IDS" ]; then
    echo "Found milestones to delete:"
    for milestone_id in $MILESTONE_IDS; do
        echo "Deleting milestone ID: $milestone_id"
        curl -s -X POST "$API_URL" \
            -H "Content-Type: application/json" \
            -H "authtoken: $AUTH_TOKEN" \
            -d "{\"query\": \"mutation { deleteTblmilestones(id: $milestone_id) }\"}" > /dev/null
    done
fi

echo
echo "Project 51 is now clean and ready for fresh import"