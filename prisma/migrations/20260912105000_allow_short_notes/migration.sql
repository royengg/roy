-- Keep names and the upper message limit unchanged; allow any non-empty note.
BEGIN;
ALTER TABLE "Testimonial" DROP CONSTRAINT "Testimonial_content_check";
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_content_check"
CHECK (char_length(btrim("name")) BETWEEN 2 AND 60 AND char_length(btrim("message")) BETWEEN 1 AND 280);
COMMIT;
