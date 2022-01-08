using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ModulePDF.Models
{
    public class PDFDBContext : DbContext
    {
        public PDFDBContext() : base("name=PDFDBContext") {}
        public DbSet<FilePDF> FilePDFDbSet { get; set; }
        public DbSet<Comments> CommentDbSet { get; set; }
    }

    public class ListFilePDFViewModels
    {
        public IList<FilePDF> ListFilePDF { get; set; }
    }

    [Table("FilePDF")]
    public class FilePDF
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int IdFilePDF { get; set; }
        public string FileName { get; set; }
        public string PathFile { get; set; }
        public DateTime UpdateDate { get; set; }
        public string DeleteFlag { get; set; }
    }

    public class FilePDFViewModels
    {
        public FilePDF FilePDF { get; set; }
        public IList<Comments> ListComments { get; set; }
    }

    [Table("Comments")]
    public class Comments
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int IdComment { get; set; }
        public string ContentCmt { get; set; }
        public int PositionX { get; set; }
        public int PositionY { get; set; }
        public int PageNumber { get; set; }
        public int IdFilePDF { get; set; }
        public int IdUserCreate { get; set; }
        public DateTime UpdateDate { get; set; }
        public string DeleteFlag { get; set; }
    }
}