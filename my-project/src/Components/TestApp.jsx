import * as React from "react";

const title = "React";
const welcome = {
  greeting: "Hello",
  party: "React",
};

function getKocka(kocka) {
  return kocka;
}

const simonList = [
  {
    title: "React",
    url: "test.se",
    author: "Jordan Walke",
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: "Vue",
    url: "123123.se",
    author: "Evan You",
    num_comments: 2,
    points: 3,
    objectID: 1,
  },
];

const TestApp = () => {
  const stories = [
    {
      title: "React",
      url: "test.se",
      author: "Jordan Walke",
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: "Vue",
      url: "123123.se",
      author: "Evan You",
      num_comments: 2,
      points: 3,
      objectID: 2,
    },
  ];

    const [searchTerm, setSearchTerm] = React.useState('React'); //State hook som skapar en state variabel searchTerm och en funktion setSearchTerm för att uppdatera den. Initialt är searchTerm en tom sträng.

    const handleSearch = (event) => 
      {setSearchTerm(event.target.value)  //Current value inside the input box via event.target.value
  };

   const searchedStories = stories.filter((story)  =>
     story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Yo, Hello</h1>
      <h1>
        {welcome.greeting}, {welcome.party}!
      </h1>
      <h1> Tjena {getKocka("XDKocka")}</h1>

      <Search search={searchTerm} onSearch={handleSearch} />  

      <TestList list={searchedStories} />
    </div>
  );
};

export default TestApp; //Expoertera för att göra tillgänglig i annan fil

//Ny komponent som renderar en lista av objekt från simonList
const TestList = ({list}) => (
  //<List>
  //Standard function
    <ul>
      {list.map((item) => (
        <Item 
        key={item.objectID} 
        title={item.title}
        url={item.url}
        author={item.author}
        num_comments={item.num_comments}
        points={item.points}
        />
      ))}
    </ul>
    ); 


const Item = ({title, url, author, num_comments, points}) => (
  <li>
    <span>
      <a href={url}>{title}</a>
    </span>
    <span>{author}</span>
    <span>{num_comments}</span>
    <span>{points}</span>
  </li>
);

const Search = ({search, onSearch}) => {
  //Arrow function //MEN BEHÖVER INGEN  MÅSVINGE ELLER RETURN PGA RETURNERAR INGET ANNAT ÄN JSX

  return (
    <div>
      <label htmlFor="search">Search</label>
      <input
        id="search"
        type="text"
        className="border border-gray-300 rounded px-2 py-1"
        placeholder="Type something..."
        value={search}
        onChange={onSearch} //Varje gång fältet ändras så kallas på onSearch funktionen som skickas in som prop från TestApp komponenten. 
        //Den uppdaterar searchTerm state variabeln med det nya värdet från inputfältet.
      />
    </div>
  );
};
