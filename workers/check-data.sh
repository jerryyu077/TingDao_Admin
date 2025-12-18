#!/bin/bash

echo "🔍 查询数据库中的讲员和主题..."
echo ""
echo "=== 讲员列表 ==="
wrangler d1 execute tingdao-db --remote --command "SELECT id, name FROM speakers LIMIT 10"

echo ""
echo "=== 主题列表 ==="
wrangler d1 execute tingdao-db --remote --command "SELECT id, name FROM topics LIMIT 10"

echo ""
echo "=== 讲道列表 ==="
wrangler d1 execute tingdao-db --remote --command "SELECT id, title FROM sermons LIMIT 5"





