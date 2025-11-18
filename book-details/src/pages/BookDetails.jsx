import {book} from '../data/book.js'
import NavBar from "../components/NavBar.jsx";
import BookHeader from '../components/BookHeader.jsx';
import BookCover from '../components/BookCover.jsx';
import BookDescription from '../components/BookDescription.jsx';
import BookRatingReview from '../components/BookRatingReview.jsx';
import BookAvailability from '../components/BookAvailability.jsx'
import RelatedBooks from '../components/RelatedBooks.jsx';

export default function BookDetails() {
    return (
        <div>
            <NavBar />
            <BookHeader book={book} />
            <BookCover book={book} />
            <BookDescription book={book} />
            <BookRatingReview book={book}/>
            <BookAvailability book={book}/>
            <RelatedBooks book={book}/>
        </div>
    );
}