#!/bin/bash

# Future You - 数据迁移到 Cloudflare KV
# 使用方法：./migrate-kv.sh

# ==================== 配置区域 ====================

# 请将下面的 ID 替换为你的实际 KV 命名空间 ID
USERS_NS="YOUR_USERS_NAMESPACE_ID"
LETTERS_NS="YOUR_LETTERS_NAMESPACE_ID"
PARTNERSHIPS_NS="YOUR_PARTNERSHIPS_NAMESPACE_ID"
REQUESTS_NS="YOUR_PARTNERSHIP_REQUESTS_NAMESPACE_ID"

# 数据文件路径（相对于脚本所在目录）
DATA_DIR="./server/data"

# ==================== 工具函数 ====================

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 检查 jq 是否安装
check_jq() {
    if ! command -v jq &> /dev/null; then
        print_error "jq 未安装，请先安装 jq"
        print_info "安装命令："
        print_info "  macOS: brew install jq"
        print_info "  Linux: sudo apt-get install jq"
        exit 1
    fi
}

# 检查 wrangler 是否安装
check_wrangler() {
    if ! command -v wrangler &> /dev/null; then
        print_error "wrangler 未安装，请先安装 wrangler"
        print_info "安装命令：npm install -g wrangler"
        exit 1
    fi
}

# ==================== 迁移函数 ====================

migrate_users() {
    print_info "开始迁移用户数据..."

    local file="$DATA_DIR/users.json"
    if [ ! -f "$file" ]; then
        print_error "文件不存在: $file"
        return 1
    fi

    local count=0
    local errors=0

    while IFS= read -r user; do
        user_id=$(echo "$user" | jq -r '._id')
        username=$(echo "$user" | jq -r '.username')

        echo "$user" | wrangler kv:key put --namespace-id="$USERS_NS" "user:$user_id" > /dev/null 2>&1

        if [ $? -eq 0 ]; then
            ((count++))
            print_success "迁移用户: $username ($user_id)"
        else
            ((errors++))
            print_error "迁移失败: $username"
        fi
    done < <(jq -c '.[]' "$file")

    echo ""
    print_info "用户数据迁移完成：成功 $count 个，失败 $errors 个"
}

migrate_letters() {
    print_info "开始迁移信件数据..."

    local file="$DATA_DIR/letters.json"
    if [ ! -f "$file" ]; then
        print_error "文件不存在: $file"
        return 1
    fi

    local count=0
    local errors=0

    while IFS= read -r letter; do
        letter_id=$(echo "$letter" | jq -r '._id')
        title=$(echo "$letter" | jq -r '.title')

        echo "$letter" | wrangler kv:key put --namespace-id="$LETTERS_NS" "letter:$letter_id" > /dev/null 2>&1

        if [ $? -eq 0 ]; then
            ((count++))
            print_success "迁移信件: $title ($letter_id)"
        else
            ((errors++))
            print_error "迁移失败: $title"
        fi
    done < <(jq -c '.[]' "$file")

    echo ""
    print_info "信件数据迁移完成：成功 $count 个，失败 $errors 个"
}

migrate_partnerships() {
    print_info "开始迁移情侣关系数据..."

    local file="$DATA_DIR/partnerships.json"
    if [ ! -f "$file" ]; then
        print_error "文件不存在: $file"
        return 1
    fi

    local count=0
    local errors=0

    while IFS= read -r partnership; do
        partnership_id=$(echo "$partnership" | jq -r '._id')

        echo "$partnership" | wrangler kv:key put --namespace-id="$PARTNERSHIPS_NS" "partnership:$partnership_id" > /dev/null 2>&1

        if [ $? -eq 0 ]; then
            ((count++))
            print_success "迁移情侣关系: $partnership_id"
        else
            ((errors++))
            print_error "迁移失败: $partnership_id"
        fi
    done < <(jq -c '.[]' "$file")

    echo ""
    print_info "情侣关系数据迁移完成：成功 $count 个，失败 $errors 个"
}

migrate_requests() {
    print_info "开始迁移情侣申请数据..."

    local file="$DATA_DIR/partnershipApplications.json"
    if [ ! -f "$file" ]; then
        print_error "文件不存在: $file"
        return 1
    fi

    local count=0
    local errors=0

    while IFS= read -r request; do
        request_id=$(echo "$request" | jq -r '._id')

        echo "$request" | wrangler kv:key put --namespace-id="$REQUESTS_NS" "request:$request_id" > /dev/null 2>&1

        if [ $? -eq 0 ]; then
            ((count++))
            print_success "迁移申请: $request_id"
        else
            ((errors++))
            print_error "迁移失败: $request_id"
        fi
    done < <(jq -c '.[]' "$file")

    echo ""
    print_info "情侣申请数据迁移完成：成功 $count 个，失败 $errors 个"
}

# ==================== 主函数 ====================

main() {
    echo "========================================"
    echo "  Future You - 数据迁移到 Cloudflare KV"
    echo "========================================"
    echo ""

    # 检查依赖
    check_jq
    check_wrangler

    # 验证配置
    if [ "$USERS_NS" = "YOUR_USERS_NAMESPACE_ID" ]; then
        print_error "请先配置 KV 命名空间 ID"
        print_info "编辑此脚本，将 YOUR_*_NAMESPACE_ID 替换为实际 ID"
        exit 1
    fi

    # 确认迁移
    print_info "准备开始数据迁移..."
    print_info "  用户数据: $USERS_NS"
    print_info "  信件数据: $LETTERS_NS"
    print_info "  情侣关系: $PARTNERSHIPS_NS"
    print_info "  情侣申请: $REQUESTS_NS"
    echo ""
    read -p "确认开始迁移？(yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        print_info "已取消迁移"
        exit 0
    fi

    echo ""
    echo "开始迁移..."
    echo ""

    # 执行迁移
    migrate_users
    echo ""

    migrate_letters
    echo ""

    migrate_partnerships
    echo ""

    migrate_requests
    echo ""

    echo "========================================"
    print_success "所有数据迁移完成！"
    echo "========================================"
}

# 运行主函数
main
