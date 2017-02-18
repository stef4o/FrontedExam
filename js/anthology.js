function Anthology(id, title, editor, publisher, yearOfPublication, length, stories, ISBN, review) {
    this.kind = "anthology";
    this.id = id;
    this.title = title;
    this.editor = editor;
    this.publisher = publisher;
    this.yearOfPublication = yearOfPublication;
    this.length = length;
    this.stories = stories;
    this.ISBN = ISBN;
    this.review = review;
}