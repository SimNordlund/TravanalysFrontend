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

      <InputWithLabel
        id="search"
        label="Search"
        value={searchTerm}
        onInputChange={handleSearch}
      />

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

const InputWithLabel = ({
  id, 
  label, 
  value, 
  type = 'text',
  onInputChange 
}) => {

  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        className="border border-gray-300 rounded px-2 py-1"
        placeholder="Type something..."
        value={value}
        onChange={onInputChange}
      />
    </>
  );
};
