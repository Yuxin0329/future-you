/**
 * 数据迁移脚本 - 从 JSON 文件迁移到 Cloudflare KV
 *
 * 使用方法：
 * 1. 确保已经创建好 KV 命名空间
 * 2. 将 KV 命名空间 ID 填入下面的配置
 * 3. 运行：node migrate-to-kv.js
 */

import { readFileSync } from 'fs';

// ==================== 配置区域 ====================

// KV 命名空间 ID（需要替换为实际的 KV 命名空间 ID）
const KV_NAMESPACES = {
  USERS: 'your_users_namespace_id',
  LETTERS: 'your_letters_namespace_id',
  PARTNERSHIPS: 'your_partnerships_namespace_id',
  PARTNERSHIP_REQUESTS: 'your_partnership_requests_namespace_id',
  IMAGES: 'your_images_namespace_id'
};

// Cloudflare API 凭证
const CLOUDFLARE_API_TOKEN = 'your-cloudflare-api-token';
const CLOUDFLARE_ACCOUNT_ID = 'your-cloudflare-account-id';

// JSON 数据文件路径（相对于脚本所在目录）
const DATA_FILES = {
  users: './server/data/users.json',
  letters: './server/data/letters.json',
  partnerships: './server/data/partnerships.json',
  partnershipApplications: './server/data/partnershipApplications.json'
};

// ==================== 工具函数 ====================

/**
 * 读取 JSON 文件
 */
function readJSONFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`读取文件失败: ${filePath}`, error);
    return [];
  }
}

/**
 * 发送 Cloudflare API 请求
 */
async function cloudflareRequest(endpoint, method, body = null) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/${endpoint}`;

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!data.success) {
    throw new Error(`Cloudflare API 错误: ${JSON.stringify(data.errors)}`);
  }

  return data.result;
}

/**
 * 写入 KV 键值对
 */
async function writeKV(namespaceId, key, value, metadata = null) {
  const endpoint = `storage/kv/namespaces/${namespaceId}/values/${key}`;

  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/${endpoint}`;

  const options = {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(value)
  };

  if (metadata) {
    options.headers['Content-Metadata'] = JSON.stringify(metadata);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!data.success) {
    throw new Error(`写入 KV 失败: ${JSON.stringify(data.errors)}`);
  }

  console.log(`✅ 写入成功: ${key}`);
}

/**
 * 批量写入 KV
 */
async function batchWriteKV(namespaceId, key, value) {
  const endpoint = `storage/kv/namespaces/${namespaceId}/bulk`;

  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/${endpoint}`;

  const options = {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([
      {
        key,
        value: JSON.stringify(value)
      }
    ])
  };

  const response = await fetch(url, options);
  const data = await response.json();

  if (!data.success) {
    throw new Error(`批量写入 KV 失败: ${JSON.stringify(data.errors)}`);
  }
}

// ==================== 迁移函数 ====================

/**
 * 迁移用户数据
 */
async function migrateUsers() {
  console.log('\n📦 开始迁移用户数据...');

  const users = readJSONFile(DATA_FILES.users);
  console.log(`找到 ${users.length} 个用户`);

  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      const key = `user:${user._id}`;
      await writeKV(KV_NAMESPACES.USERS, key, user);
      successCount++;
    } catch (error) {
      console.error(`❌ 迁移用户失败 (${user.username}):`, error.message);
      errorCount++;
    }
  }

  console.log(`\n✨ 用户数据迁移完成！`);
  console.log(`   成功: ${successCount}, 失败: ${errorCount}`);
}

/**
 * 迁移信件数据
 */
async function migrateLetters() {
  console.log('\n📬 开始迁移信件数据...');

  const letters = readJSONFile(DATA_FILES.letters);
  console.log(`找到 ${letters.length} 封信件`);

  let successCount = 0;
  let errorCount = 0;

  for (const letter of letters) {
    try {
      const key = `letter:${letter._id}`;
      await writeKV(KV_NAMESPACES.LETTERS, key, letter);
      successCount++;
    } catch (error) {
      console.error(`❌ 迁移信件失败 (${letter.title}):`, error.message);
      errorCount++;
    }
  }

  console.log(`\n✨ 信件数据迁移完成！`);
  console.log(`   成功: ${successCount}, 失败: ${errorCount}`);
}

/**
 * 迁移情侣关系数据
 */
async function migratePartnerships() {
  console.log('\n💕 开始迁移情侣关系数据...');

  const partnerships = readJSONFile(DATA_FILES.partnerships);
  console.log(`找到 ${partnerships.length} 个情侣关系`);

  let successCount = 0;
  let errorCount = 0;

  for (const partnership of partnerships) {
    try {
      const key = `partnership:${partnership._id}`;
      await writeKV(KV_NAMESPACES.PARTNERSHIPS, key, partnership);
      successCount++;
    } catch (error) {
      console.error(`❌ 迁移情侣关系失败:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n✨ 情侣关系数据迁移完成！`);
  console.log(`   成功: ${successCount}, 失败: ${errorCount}`);
}

/**
 * 迁移情侣申请数据
 */
async function migratePartnershipRequests() {
  console.log('\n💌 开始迁移情侣申请数据...');

  const requests = readJSONFile(DATA_FILES.partnershipApplications);
  console.log(`找到 ${requests.length} 个申请`);

  let successCount = 0;
  let errorCount = 0;

  for (const request of requests) {
    try {
      const key = `request:${request._id}`;
      await writeKV(KV_NAMESPACES.PARTNERSHIP_REQUESTS, key, request);
      successCount++;
    } catch (error) {
      console.error(`❌ 迁移申请失败:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n✨ 情侣申请数据迁移完成！`);
  console.log(`   成功: ${successCount}, 失败: ${errorCount}`);
}

// ==================== 主函数 ====================

async function main() {
  console.log('========================================');
  console.log('  Future You - 数据迁移到 Cloudflare KV');
  console.log('========================================');

  try {
    // 验证配置
    console.log('\n🔍 验证配置...');
    if (CLOUDFLARE_API_TOKEN === 'your-cloudflare-api-token') {
      throw new Error('请配置 CLOUDFLARE_API_TOKEN');
    }
    if (CLOUDFLARE_ACCOUNT_ID === 'your-cloudflare-account-id') {
      throw new Error('请配置 CLOUDFLARE_ACCOUNT_ID');
    }
    console.log('✅ 配置验证通过');

    // 迁移用户数据
    await migrateUsers();

    // 迁移信件数据
    await migrateLetters();

    // 迁移情侣关系数据
    await migratePartnerships();

    // 迁移情侣申请数据
    await migratePartnershipRequests();

    console.log('\n========================================');
    console.log('🎉 所有数据迁移完成！');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// ==================== 备用方案：生成迁移命令 ====================

/**
 * 生成 wrangler 命令用于迁移
 */
function generateWranglerCommands() {
  console.log('\n========================================');
  console.log('  生成 Wrangler 迁移命令');
  console.log('========================================\n');

  const commands = [];

  // 用户数据
  commands.push('# 迁移用户数据');
  commands.push('npx wrangler kv:key put --namespace-id=YOUR_USERS_NAMESPACE_ID "user:USER_ID" --path=./server/data/users.json\n');

  // 信件数据
  commands.push('# 迁移信件数据');
  commands.push('npx wrangler kv:key put --namespace-id=YOUR_LETTERS_NAMESPACE_ID "letter:LETTER_ID" --path=./server/data/letters.json\n');

  // 情侣关系数据
  commands.push('# 迁移情侣关系数据');
  commands.push('npx wrangler kv:key put --namespace-id=YOUR_PARTNERSHIPS_NAMESPACE_ID "partnership:PARTNERSHIP_ID" --path=./server/data/partnerships.json\n');

  // 情侣申请数据
  commands.push('# 迁移情侣申请数据');
  commands.push('npx wrangler kv:key put --namespace-id=YOUR_PARTNERSHIP_REQUESTS_NAMESPACE_ID "request:REQUEST_ID" --path=./server/data/partnershipApplications.json\n');

  commands.forEach(cmd => console.log(cmd));
}

// ==================== 运行 ====================

// 检查命令行参数
const args = process.argv.slice(2);

if (args.includes('--generate-commands')) {
  generateWranglerCommands();
} else {
  main();
}
