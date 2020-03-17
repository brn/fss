FROM node:13.8.0 as build

RUN mkdir -p /usr/local/app
WORKDIR /usr/local/app
COPY . ./
ARG api_server_url
ENV API_SERVER_URL $api_server_url
RUN yarn install
RUN yarn build

FROM nginx:1.17.8

ADD ./nginx.conf /etc/nginx/
COPY --from=build /usr/local/app/dist/ /usr/share/nginx/html
