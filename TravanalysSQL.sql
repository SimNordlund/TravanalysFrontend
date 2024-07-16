drop database travanalys;
create database travanalys;

CREATE USER 'travanalys_admin'@'localhost' IDENTIFIED BY 'password';
grant all on *.* to 'travanalys_admin'@'localhost' with grant option;

SELECT * FROM travanalys.horse;
SELECT * FROM travanalys.lap;
SELECT * FROM travanalys.performance;
SELECT * FROM travanalys.race;
SELECT * FROM travanalys.radarhorse;

SELECT * from travanalys.user;
SELECT * from travanalys.role;


