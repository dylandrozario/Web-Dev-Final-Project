import LOTR from "../images/LOTR.jpg"
import hobbit from "../images/hobbit.jpg"
import fellowship from "../images/fellowship.jpg"
import towers from "../images/towers.jpg"
import king from "../images/king.jpg"

export const book = {
    "title": "The Lord of the Rings",
    "author": "J.R.R. Tolkien",
    "cover": LOTR,
    "description": "The Lord of the Rings is a fantasy novel by J.R.R. Tolkien about the hobbit Frodo Baggins who must destroy the One Ring, an artifact of immense power created by the Dark Lord Sauron. To save their world, Middle-earth, from Sauron's conquest, Frodo undertakes a perilous quest with a Fellowship of nine companions to cast the Ring into the fires of Mount Doom. The story follows their journey, the breaking of the Fellowship, and the wider war against Sauron's forces.",
    "releaseDate": "1954-07-29",
    "isbn": "978-0-544-00035-4",
    "tags": ["Fantasy", "Adventure", "Fantasy Fiction", "Epic Fantasy"],
    "ratings": [1,2,3,3,4,4,4,5,5,5,5,5],
    "reviews": [
        {
            "author": "Jason",
            "rating": 5,
            "upvotes": 10,
            "comment": "I liked this book."
        },
        {
            "author": "John Doe",
            "rating": 4,
            "upvotes": 20,
            "comment": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            "author": "Liana",
            "rating": 1,
            "upvotes": 5,
            "comment": "I hated this book."
        },
        {
            "author": "Dylan",
            "rating": 3,
            "upvotes": 25,
            "comment": "This book was alright."
        },
        {
            "author": "Sarah Smith",
            "rating": 2,
            "upvotes": 15,
            "comment": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            "author": "Omar",
            "rating": 1,
            "upvotes": 10,
            "comment": "I do not recommend this book."
        }
    ],
    "availability": [
        {
            "library": "O'Neill",
            "available": 3,
            "quantity": 10,
            "type": "Hardcover"
        },
        {
            "library": "Bapst",
            "available": 0,
            "quantity": 5,
            "type": "Audiobook"
        }
    ],
    relatedBooks: [
        { title: "The Hobbit", image: hobbit },
        { title: "The Fellowship of the Ring", image: fellowship },
        { title: "The Two Towers", image: towers },
        { title: "The Return of the King", image: king }
      ]          // eventually will make these somehow links to another book obj
}