using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using ModulePDF.Models;

namespace ModulePDF.Controllers
{
    public class CommentsController : ApiController
    {
        private PDFDBContext db = new PDFDBContext();

        // GET: api/Comments
        [Route("api/Comments/{id}/{pageNum}")]
        public IQueryable<Comments> Getcomments(int id, int pageNum)
        {
            return db.comments.Where(v => v.IdFilePDF == id && v.DeleteFlag == "0" && v.PageNumber == pageNum);
        }

        /*// GET: api/Comments/5
        [ResponseType(typeof(Comments))]
        public IHttpActionResult GetComments(int id)
        {
            Comments comments = db.comments.Find(id);
            if (comments == null)
            {
                return NotFound();
            }

            return Ok(comments);
        }*/

        // PUT: api/Comments/5
        [HttpPut]
        [ResponseType(typeof(void))]
        public IHttpActionResult PutComments(int id, Comments comments)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != comments.IdComment)
            {
                return BadRequest();
            }
            Comments commentsUpdate = db.comments.Find(id);
            if (comments == null)
            {
                return NotFound();
            }
            commentsUpdate.ContentCmt = comments.ContentCmt;
            commentsUpdate.UpdateDate = DateTime.Now;

            db.Entry(commentsUpdate).State = EntityState.Modified;
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CommentsExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Comments
        [HttpPost]
        [ResponseType(typeof(Comments))]
        public IHttpActionResult PostComments(Comments comments)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            comments.UpdateDate = DateTime.Now;
            db.comments.Add(comments);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = comments.IdComment }, comments);
        }

        // DELETE: api/Comments/5
        [HttpDelete]
        [ResponseType(typeof(Comments))]
        public IHttpActionResult DeleteComments(int id)
        {
            Comments comments = db.comments.Find(id);
            if (comments == null)
            {
                return NotFound();
            }
            comments.DeleteFlag = "1";
            comments.UpdateDate = DateTime.Now;
            db.Entry(comments).State = EntityState.Modified;
            //db.comments.Remove(comments);
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CommentsExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return Ok(comments);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool CommentsExists(int id)
        {
            return db.comments.Count(e => e.IdComment == id) > 0;
        }
    }
}