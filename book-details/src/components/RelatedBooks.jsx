export default function RelatedBooks({ book }) {
    return (
      <div>
        <ul>
            <p>Enjoyed {book.title}? Try these!</p>
          {book.relatedBooks.map((item, index) => (
            <li key={index}>
              <img src={item.image} alt={item.image} /> <br></br>
              <a href="#">{item.title}</a>
            </li>
          ))}
        </ul>
      </div>
    );
  }  