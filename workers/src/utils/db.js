/**
 * 数据库查询工具函数
 */

// 查询所有记录
export async function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  const result = await stmt.bind(...params).all();
  return result.results || [];
}

// 查询单条记录
export async function queryOne(db, sql, params = []) {
  const stmt = db.prepare(sql);
  const result = await stmt.bind(...params).first();
  return result || null;
}

// 执行更新/插入/删除
export async function execute(db, sql, params = []) {
  const stmt = db.prepare(sql);
  const result = await stmt.bind(...params).run();
  return result;
}

// 分页查询
export async function queryPaginated(db, sql, params = [], page = 1, perPage = 10) {
  // 计算总数 - 使用子查询包装原始SQL
  let countSql;
  try {
    // 移除ORDER BY子句
    const sqlWithoutOrder = sql.replace(/ORDER BY[\s\S]+$/i, '');
    // 包装为子查询
    countSql = `SELECT COUNT(*) as total FROM (${sqlWithoutOrder}) as subquery`;
    const countResult = await queryOne(db, countSql, params);
    var total = countResult ? countResult.total : 0;
  } catch (e) {
    console.error('Count query failed:', e);
    // 如果COUNT失败，设置为0
    var total = 0;
  }
  
  // 分页查询
  const offset = (page - 1) * perPage;
  const paginatedSql = `${sql} LIMIT ? OFFSET ?`;
  const results = await queryAll(db, paginatedSql, [...params, perPage, offset]);
  
  return {
    data: results,
    pagination: {
      page: parseInt(page),
      per_page: parseInt(perPage),
      total: total,
      total_pages: Math.ceil(total / perPage)
    }
  };
}

// 解析JSON字段
export function parseJsonField(obj, field) {
  if (obj[field] && typeof obj[field] === 'string') {
    try {
      obj[field] = JSON.parse(obj[field]);
    } catch (e) {
      console.error(`Failed to parse JSON field ${field}:`, e);
    }
  }
  return obj;
}

// 解析多个JSON字段
export function parseJsonFields(obj, fields) {
  fields.forEach(field => parseJsonField(obj, field));
  return obj;
}

// 批量解析JSON字段
export function parseJsonFieldsInArray(arr, fields) {
  return arr.map(obj => parseJsonFields(obj, fields));
}

