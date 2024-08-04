drop database travanalys;
create database travanalys;

CREATE USER 'travanalys_admin'@'localhost' IDENTIFIED BY 'password';
grant all on *.* to 'travanalys_admin'@'localhost' with grant option;

SELECT * FROM travanalys.horse;

SELECT * FROM travanalys.track;
SELECT * FROM travanalys.lap;
SELECT * FROM travanalys.competition;
SELECT * FROM travanalys.complete_horse;
SELECT * FROM travanalys.four_starts;
SELECT * FROM travanalys.eight_starts;
SELECT * FROM travanalys.twelve_starts;


SELECT * FROM travanalys.radar_horse;

SELECT * from travanalys.user;
SELECT * from travanalys.role;


