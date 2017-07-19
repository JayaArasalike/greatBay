create database greatbay_db;
use greatbay_db;

create table auction(
	id integer(11) not null auto_increment,
    itemname varchar(50) not null,
    category varchar(50) not null,
    startingbid integer default 0,
	highestbid integer default 0,
    primary key(id)
    );