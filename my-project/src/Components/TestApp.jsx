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

const useStorageState = (key, initialState) => {
  const [value, setValue] = React.useState(
      localStorage.getItem(key) || initialState
    );
  

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

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

  const [searchTerm, setSearchTerm] = useStorageState("search", "React");

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const searchedStories = stories.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()),
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
const TestList = ({ list }) => (
  //<List>
  //Standard function
  <ul>
    {list.map((item) => (
      <Item key={item.objectID} item={item} />
    ))}
  </ul>
);

const Item = ({ item }) => (
  <li>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>
    <span>{item.author}</span>
    <span>{item.num_comments}</span>
    <span>{item.points}</span>
  </li>
);

const Search = ({ search, onSearch }) => {
  //Arrow function //MEN BEHÖVER INGEN  MÅSVINGE ELLER RETURN PGA RETURNERAR INGET ANNAT ÄN JSX

  return (
    <>
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
    </>
  );
};
