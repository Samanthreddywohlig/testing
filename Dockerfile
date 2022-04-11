FROM node:dubnium
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies 
# A wildcard is used to ensure both package.json AND package-lock.json are copied 
# where available (npm@5+) 
COPY package*.json ./  
ENV NODE_ENV development
RUN npm install
# If you are building your code for production 
# RUN npm install --only=production 
# Bundle app source
COPY . .
EXPOSE 3000
RUN cd node_modules/geoip-lite && node scripts/updatedb.js "license_key=YZLvjSIwWiIF"
CMD ["npm","start"]