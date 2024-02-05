cara deploy di vps

1.  masuk ke vps ssh user@ip
2.  update linux: apt-get update
3.  install nodejs: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
4.  install nodejs: sudo apt-get install -y nodejs
5.  install git: sudo apt-get install git
6.  buat folder: mkdir -p ~/apps/nama-folder/repo
7.  di project ini: mkdir -p ~/apps/rekapitulasi/repo
8.  bikin juga(unutk production): mkdir -p ~/apps/rekapitulasi/dest
9.  masuk ke repo: cd ~/apps/rekapitulasi/repo
10. bikin repo git: git --bare init
11. nano hooks/post-receive
12. ketikan
    ```bash
    #!/bin/bash -l
    echo 'post-receive: Triggered.'
    cd ~/apps/rekapitulasi/dest/
    echo 'post-receive: git check out...'
    git --git-dir=/root/apps/rekapitulasi/repo/ --work-tree=/root/apps/rekapitulasi/dest/ checkout master -f
    npm install
    npm run build
    forever restart rekapitulasi
    ```
13. chmod ug+x hooks/post-receive
14. siapkan mongodb atlas
15. cd ../dest
16. nano .env
17. sudo apt-get install apache2
18. sudo a2enmod proxy proxy_http rewrite headers expires
19. sudo nano /etc/apache2/sites-available/monitorpemilu.site.conf
20. masukkan

```bash
<VirtualHost *:80>
    ServerName monitorpemilu.site
    ServerAlias www.monitorpemilu.site

    ProxyRequests off
    ProxyPreserveHost on
    ProxyVia Full

    <Proxy *>
        Require all granted
    </Proxy>

    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>

```

21. sudo a2dissite 000-default
22. sudo a2ensite monitorpemilu.site.conf
23. sudo systemctl restart apache2
24. sudo apt install certbot python3-certbot-apache
25. sudo certbot -d monitorpemilu.site -d www.monitorpemilu.site --apache --agree-tos -m fikiaprian23@gmail.com --no-eff-email --redirect
26. sudo certbot renew --dry-run
27. npm install -g forever
28. forever start --uid="rekapitulasi" --sourceDir="/root/apps/rekapitulasi/dest/" backend/server.js
29. pindah ke local komputer, masuk ke project dan tautkan remote ssh repo
30. git remote add rekapitulasi ssh://user@ip/root/apps/rekapitulasi/repo/
31. Lakukan perubahan pada repo, misal update readme atau apapun
32. jalankan: git add . && git commit -m "message" && git push rekapitulasi
33. buat deploy di vps
