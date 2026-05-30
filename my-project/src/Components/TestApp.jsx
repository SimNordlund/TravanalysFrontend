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

  return (
    <div>
      <h1>Yo, Hello</h1>
      <h1>
        {welcome.greeting}, {welcome.party}!
      </h1>
      <h1> Tjena {getKocka("XDKocka")}</h1>

      <Search />
      <TestList list={stories} />

    </div>
  );
};
export default TestApp; //Expoertera för att göra tillgänglig i annan fil

//Ny komponent som renderar en lista av objekt från simonList
function TestList(props) { //<List>
  //Standard function
  return (
    <ul>
      {props.list.map((item) => (
        <Item key={item.objectID} item={item} />
      ))}
    </ul>
  );
}

const Item = (props) => (
  <li>
    <span>
      <a href={props.item.url}>{props.item.title}</a>
    </span>
    <span>{props.item.author}</span>
    <span>{props.item.num_comments}</span>
    <span>{props.item.points}</span>
  </li>
)

const Search = () => { //Arrow function //MEN BEHÖVER INGEN  MÅSVINGE ELLER RETURN PGA RETURNERAR INGET ANNAT ÄN JSX

  const handleChange = (event) => {
    console.log(event);
    console.log (event.target.value);
  };


  return (
    <div>
      <label htmlFor="search">Search</label>
      <input 
        id="search"
        type="text"
        className="border border-gray-300 rounded px-2 py-1"
        placeholder="Type something..."
        onChange={handleChange}
      />
    </div>
  );
};
