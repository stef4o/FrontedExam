class Novel extends Book {
    constructor(id, title, author, publisher, year, length, series, seriesNumber, ISBN, review) {
        super(id, "novel", title, author, publisher, year, length, ISBN, review)
        this.series = series;
        this.seriesNumber = seriesNumber;
    }
}