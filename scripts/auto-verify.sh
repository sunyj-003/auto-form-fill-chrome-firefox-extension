#!/bin/bash
# 自动表单填充测试循环
# 持续运行直到所有测试通过或达到最大迭代次数

MAX_ITERATIONS=20
ITERATION=1

echo "=========================================="
echo "自动表单填充测试循环"
echo "=========================================="

while [ $ITERATION -le $MAX_ITERATIONS ]; do
  echo ""
  echo "========== 迭代 $ITERATION / $MAX_ITERATIONS =========="
  echo "时间: $(date)"
  echo ""

  # 运行 Playwright 测试
  npx playwright test e2e/form-test.spec.js --reporter=line 2>&1 | tee test-output.txt
  TEST_EXIT_CODE=${PIPESTATUS[0]}

  if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ =========================================="
    echo "🎉 所有测试通过！循环结束"
    echo "=========================================="
    exit 0
  fi

  echo ""
  echo "❌ 测试失败，提取失败信息..."
  echo ""

  # 提取失败信息（最多 30 行）
  FAILURE=$(grep -A 20 "FAILED\|Error\|failed\|✗" test-output.txt | head -30)
  ERROR_LINES=$(grep -n "Error\|failed" test-output.txt | head -10)

  echo "========== 失败信息 =========="
  echo "$FAILURE"
  echo ""

  # 让 Claude 修复
  echo "🤖 调用 Claude 修复 content.js..."

  claude -p "Playwright E2E 测试失败了。请分析失败信息并修复 Chrome-Extension/content.js 中的问题。

## 测试文件
e2e/form-test.spec.js

## 测试页面
form-test/index.html - 包含主流前端框架的表单测试:
1. 原生 HTML 表单 (input, select, checkbox, radio, file, textarea)
2. Element Plus (Vue 3) - el-input, el-select, el-date-picker, el-input-number
3. Ant Design Vue - a-input, a-select, a-input-number
4. React Select (通过 Select2 模拟)
5. jQuery Select2

## 失败信息:
$FAILURE

## 修复要求:
1. 只修改 Chrome-Extension/content.js，不要创建新文件
2. 确保原生 HTML 表单可以正常填充
3. 确保 Element Plus 组件可以正常填充
4. 确保 Select2 下拉框可以正常填充
5. 修复后运行测试验证

## 验收标准:
- npx playwright test e2e/form-test.spec.js 全部通过
- 所有主流框架的表单字段都能被正确填充

请开始修复并验证。"

  ITERATION=$((ITERATION + 1))
  echo ""
  echo "等待 3 秒后继续下一次迭代..."
  sleep 3
done

echo ""
echo "❌ =========================================="
echo "达到最大迭代次数 $MAX_ITERATIONS，循环结束"
echo "=========================================="
exit 1