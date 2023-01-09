export AWS_PROFILE=timestack
rm -rf .dist
cd ..
tsc
mv ./.dist ./ApiService/.dist
cp -R ./ApiService/package.json ./ApiService/.dist/ApiService/package.json
cp -R ./shared/package.json ./ApiService/.dist/shared/package.json
cp -R ./shared/email ./ApiService/.dist/shared/email
cd ApiService
docker build -t timestack:latest . --platform linux/x86_64
