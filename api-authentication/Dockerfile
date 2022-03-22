FROM  node:alpine

WORKDIR /user/app/

COPY package*.json ./
RUN npm install
RUN npm install pm2 -g 

COPY . .

EXPOSE 5005

CMD [ "pm2-runtime", "src/index.js" ]