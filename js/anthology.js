class Anthology extends Book {
    constructor(id, title, author, publisher, year, length, stories, ISBN, review) {
        super(id, "anthology", title, author, publisher, year, length, ISBN, review)
        this.stories = stories;
    }
}