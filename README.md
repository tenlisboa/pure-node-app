# How to configure the project

To generate the ssl you ca do `cd/https` and run `openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem`:

- Remember to fill o Common Name question your server domain, as `localhost` or `something.com`.
