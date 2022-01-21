create database ModulePDF;
use ModulePDF;
create table FilePDF(
    idFilePDF integer primary key identity (1000,1),
	fileName varchar(255),
	pathFile ntext not null,
	updateDate datetime default(getdate()),
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
	updateDate datetime default(getdate()), 
	deleteFlag varchar(1) default(0)
);

insert into FilePDF (fileName, pathFile) 
values 
 ('PDF Sample 1', '/pdf/PDF Sample 1.pdf')
,('PDF Sample 2', '/pdf/PDF Sample 2.pdf')
,('PDF Sample 3', '/pdf/PDF Sample 3.pdf')
,('PDF Sample 4', '/pdf/PDF Sample 4.pdf')
,('PDF Sample 5', '/pdf/PDF Sample 5.pdf')
,('PDF Sample 6', '/pdf/PDF Sample 6.pdf')
,('PDF Sample 7', '/pdf/PDF Sample 7.pdf')
,('PDF Sample 8', '/pdf/PDF Sample 8.pdf');

insert into Comments (contentCmt, positionX , positionY, pageNumber, idFilePDF, idUserCreate)
values 
 (N'Nội dung cmt 1', 300, 200, 1, 1000, 1000)
,(N'Nội dung cmt 2', 100, 200, 1, 1000, 1000)
,(N'Nội dung cmt 3', 30, 600, 1, 1000, 1000)
,(N'Nội dung cmt 4', 430, 230, 1, 1000, 1000)
,(N'Nội dung cmt 5', 784, 456, 1, 1000, 100);

select * from FilePDF;
select * from Comments;