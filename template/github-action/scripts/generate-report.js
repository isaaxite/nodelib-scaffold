#!/usr/bin/env node

const fs = require('fs');

const CONFIG = {
  MAX_COMMENT_LENGTH: 65000,
  SAFE_MARGIN: 2000,
  MIN_TABLE_ROWS: 10,
  DEFAULT_TABLE_ROWS: 50
};

// 解析命令行参数
const args = process.argv.slice(2);
let customTitle = null;
let maxRows = CONFIG.DEFAULT_TABLE_ROWS;
let autoAdjust = true;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--title' || args[i] === '-t') {
    if (i + 1 < args.length) {
      customTitle = args[i + 1];
      i++;
    }
  } else if (args[i] === '--max-rows') {
    if (i + 1 < args.length) {
      maxRows = parseInt(args[i + 1]);
      autoAdjust = false;
      i++;
    }
  } else if (args[i] === '--no-auto-adjust') {
    autoAdjust = false;
  }
}

let inputData = '';

process.stdin.on('data', chunk => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(inputData);
    
    if (autoAdjust) {
      // 自动调整行数以适应评论长度限制
      const result = generateWithAutoAdjust(data, customTitle, maxRows);
      console.log(result.markdown);
      if (result.adjusted) {
        console.error(`📊 Auto-adjusted: Using ${result.rowsUsed} rows out of ${data.asserts.length} total (limit: ${CONFIG.MAX_COMMENT_LENGTH} chars)`);
      }
    } else {
      // 使用固定行数
      const markdown = generateMarkdown(data, customTitle, maxRows);
      if (markdown.length > CONFIG.MAX_COMMENT_LENGTH) {
        console.error(`⚠️  Warning: Generated markdown is ${markdown.length} characters, which exceeds GitHub comment limit (${CONFIG.MAX_COMMENT_LENGTH})`);
        console.error(`💡 Tip: Use --max-rows with a smaller value or remove --no-auto-adjust`);
      }
      console.log(markdown);
    }
  } catch (error) {
    console.error('Error parsing JSON:', error.message);
    process.exit(1);
  }
});

function generateWithAutoAdjust(data, customTitle, initialRows) {
  let rowsToShow = Math.min(initialRows, data.asserts.length);
  let markdown = '';
  let adjusted = false;
  
  // 从最大行数开始尝试，逐步减少直到满足长度要求
  while (rowsToShow >= CONFIG.MIN_TABLE_ROWS) {
    markdown = generateMarkdown(data, customTitle, rowsToShow);
    
    if (markdown.length <= CONFIG.MAX_COMMENT_LENGTH - CONFIG.SAFE_MARGIN) {
      break;
    }
    
    // 减少 20% 的行数
    rowsToShow = Math.max(CONFIG.MIN_TABLE_ROWS, Math.floor(rowsToShow * 0.8));
    adjusted = true;
  }
  
  // 如果还是超过限制，强制截断 markdown
  if (markdown.length > CONFIG.MAX_COMMENT_LENGTH) {
    markdown = markdown.substring(0, CONFIG.MAX_COMMENT_LENGTH - 500) + 
      '\n\n---\n\n⚠️ **Note:** Report truncated due to length limits. Please check the workflow logs for full output.';
  }
  
  return { markdown, rowsUsed: rowsToShow, adjusted };
}

function generateMarkdown(data, customTitle = null, maxRows = CONFIG.DEFAULT_TABLE_ROWS) {
  const { stats, asserts } = data;
  
  // 确定标题
  let title = customTitle;
  if (!title) {
    if (asserts[0]?.name?.includes(' — ')) {
      title = asserts[0].name.split(' — ')[0];
    } else if (asserts[0]?.name) {
      title = asserts[0].name;
    } else {
      title = 'Test Results';
    }
  }
  
  let markdown = `## ${escapeHtml(title)}\n\n`;
  
  // 统计表格
  markdown += `| Asserts | Passes | Failures |\n`;
  markdown += `|---------|--------|----------|\n`;
  markdown += `| ${stats.asserts} | ${stats.passes} | ${stats.failures} |\n\n`;
  
  // 通过率
  const passRate = ((stats.passes / stats.asserts) * 100).toFixed(2);
  markdown += `**Pass Rate:** ${passRate}%\n\n`;
  
  // 时间戳
  const timestamp = new Date().toLocaleString();
  markdown += `*Generated at: ${timestamp}*\n\n`;
  
  // 如果有失败的测试，添加失败汇总
  const failures = asserts.filter(a => !a.ok);
  if (failures.length > 0) {
    markdown += `### ❌ Failed Tests (${failures.length})\n\n`;
    // 限制失败测试的显示数量，避免过长
    const maxFailuresToShow = 20;
    const failuresToShow = failures.slice(0, maxFailuresToShow);
    
    for (const failure of failuresToShow) {
      markdown += `<details>\n`;
      markdown += `<summary><b>${escapeHtml(failure.name)}</b> (${failure.number})</summary>\n\n`;
      
      if (failure.extra?.message) {
        markdown += `**Error:** ${escapeHtml(failure.extra.message)}\n\n`;
      }
      
      if (failure.extra?.stack) {
        // 限制堆栈长度
        let stack = escapeHtml(failure.extra.stack);
        if (stack.length > 1000) {
          stack = stack.substring(0, 1000) + '...\n*(stack trace truncated)*';
        }
        markdown += `<details>\n<summary>Stack trace</summary>\n\n`;
        markdown += `\`\`\`\n${stack}\n\`\`\`\n`;
        markdown += `</details>\n\n`;
      }
      
      markdown += `</details>\n\n`;
    }
    
    if (failures.length > maxFailuresToShow) {
      markdown += `*... and ${failures.length - maxFailuresToShow} more failures not shown*\n\n`;
    }
  }
  
  // 生成表格部分（带截断功能）
  const tableContent = generateTableWithTruncation(asserts, maxRows);
  markdown += tableContent;
  
  // 添加 PR 建议
  if (failures.length > 0) {
    markdown += `---\n\n`;
    markdown += `### 💡 Suggestions\n\n`;
    markdown += `- Please review the failed tests above\n`;
    markdown += `- Check if your changes introduced breaking changes\n`;
    markdown += `- Ensure all tests pass before merging\n`;
  } else {
    markdown += `---\n\n`;
    markdown += `### ✅ All tests passed!\n\n`;
    markdown += `This PR is ready for review and merge. 🚀\n`;
  }
  
  return markdown;
}

function generateTableWithTruncation(asserts, maxRows) {
  const totalRows = asserts.length;
  const needsTruncation = totalRows > maxRows;
  
  let tableMarkdown = `<details>\n`;
  tableMarkdown += `<summary><b>📋 All Test Details</b> (${totalRows} items${needsTruncation ? `, showing first ${maxRows}` : ''})</summary>\n\n`;
  tableMarkdown += `| # | Status | Test Name |\n`;
  tableMarkdown += `|---|--------|-----------|\n`;
  
  if (!needsTruncation) {
    // 显示所有行
    for (const assert of asserts) {
      tableMarkdown += formatTableRow(assert);
    }
  } else {
    // 显示前 maxRows 行
    for (let i = 0; i < maxRows; i++) {
      tableMarkdown += formatTableRow(asserts[i]);
    }
    
    // 添加截断提示行
    const remainingRows = totalRows - maxRows;
    tableMarkdown += `| ... | ... | ... |\n`;
    tableMarkdown += `| *${remainingRows} more items* | *truncated* | *use --max-rows to increase* |\n`;
  }
  
  tableMarkdown += `\n</details>\n\n`;
  
  return tableMarkdown;
}

function formatTableRow(assert) {
  const status = assert.ok ? '✅' : '❌';
  return `| ${assert.number} | ${status} | ${escapeHtml(assert.name)} |\n`;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>');
}
