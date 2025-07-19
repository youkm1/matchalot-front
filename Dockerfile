FROM node:18-alpine

WORKDIR /app

# Next.js standalone 빌드 결과물 복사
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

# Next.js 포트만 노출
EXPOSE 3000

# Next.js만 실행
CMD ["node", "server.js"]
