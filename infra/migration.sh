while ! mysqladmin ping -h"$MYSQL_HOST" --silent; do
    sleep 1
done

diesel migration run --migration-dir /usr/local/migrations --database-url "mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}/${MYSQL_DB}"
echo "migration done"
