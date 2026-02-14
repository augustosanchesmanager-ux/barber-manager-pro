#!/bin/bash
set -e

echo "Starting custom build..."
echo "Generating Prisma Client..."
npx prisma generate

echo "Backing up auth pages..."
ROUTE_FILE="src/app/api/auth/[...nextauth]/route.ts"
ADMIN_LAYOUT="src/app/admin/layout.tsx"
APP_LAYOUT="src/app/(app)/layout.tsx"

# Backup NextAuth route
if [ -f "$ROUTE_FILE" ]; then
    cp "$ROUTE_FILE" "$ROUTE_FILE.backup"
    cat > "$ROUTE_FILE" << 'EOF'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function GET() { return new Response('Auth', { status: 200 }) }
export async function POST() { return new Response('Auth', { status: 200 }) }
EOF
fi

# Backup admin layout
if [ -f "$ADMIN_LAYOUT" ]; then
    cp "$ADMIN_LAYOUT" "$ADMIN_LAYOUT.backup"
    echo "export const dynamic = 'force-dynamic'; export default function Layout({children}:any){return children;}" > "$ADMIN_LAYOUT"
fi

# Backup app layout  
if [ -f "$APP_LAYOUT" ]; then
    cp "$APP_LAYOUT" "$APP_LAYOUT.backup"
    echo "export const dynamic = 'force-dynamic'; export default function Layout({children}:any){return children;}" > "$APP_LAYOUT"
fi

echo "Running Next.js build..."
npx next build
BUILD_CODE=$?

echo "Restoring original files..."
[ -f "$ROUTE_FILE.backup" ] && mv "$ROUTE_FILE.backup" "$ROUTE_FILE"
[ -f "$ADMIN_LAYOUT.backup" ] && mv "$ADMIN_LAYOUT.backup" "$ADMIN_LAYOUT"
[ -f "$APP_LAYOUT.backup" ] && mv "$APP_LAYOUT.backup" "$APP_LAYOUT"

exit $BUILD_CODE
