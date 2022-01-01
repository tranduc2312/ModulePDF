create database ModulePDF;

use ModulePDF;
create table FilePDF(
    idFilePDF integer primary key identity (1000,1),
	fileName varchar(255),
	pathFile ntext not null,
	updateDate date default(getdate()),
	deleteFlag varchar(1) default(0)
);

create table Comments (
	idComment integer primary key identity(1000,1), 
	contentCmt ntext not null,
	positionX integer not null, 
	positionY integer not null,
	pageNumber integer not null,
	idFilePDF integer not null,
	idUserCreate integer not null,
	updateDate date default(getdate()), 
	deleteFlag varchar(1) default(0)
);


insert into FilePDF (fileName, pathFile, updateDate) values ('PDF Sample 1', '/pdf/PDF1.pdf', getdate());
insert into Comments (contentCmt, positionX , positionY, pageNumber, idFilePDF, idUserCreate, updateDate)
values ('Nội dung cmt 1', 300, 200, 1, 1000, 1000, getdate());

select * from FilePDF;
select * from Comments;