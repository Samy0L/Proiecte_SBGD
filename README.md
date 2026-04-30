# BibliotecaApp - Setup MySQL + phpMyAdmin

## 1) Cerinte
- XAMPP / WAMP / MAMP (Apache + MySQL + phpMyAdmin)
- PHP 8+

## 2) Creare baza de date
1. Porneste `Apache` si `MySQL`.
2. Intra in phpMyAdmin (`http://localhost/phpmyadmin`).
3. Importa fisierul:
   - `backend/init.sql`

Acest script creeaza baza `biblioteca_app`, tabelele si cativa utilizatori demo.

## 3) Configurare conexiune
Editeaza fisierul:
- `backend/config.php`

Seteaza valorile corecte pentru serverul tau:
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`

## 4) Ruleaza aplicatia
Muta proiectul in directorul web (ex: `htdocs`) si deschide:
- `http://localhost/biblioteca/index.html`

## 5) API folosit de frontend
- `GET backend/api.php?action=state` -> citeste toate datele
- `POST backend/api.php?action=save_state` -> salveaza starea curenta in MySQL

## 6) Conturi demo
- Bibliotecar: `admin01 / 1234`
- Student: `student01 / pass`
