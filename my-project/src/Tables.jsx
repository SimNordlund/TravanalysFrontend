import React, { useState } from 'react'; 
import PaginatedLapTable from "./Components/PaginatedLapTable";
import Preview from "./Preview";

export default function Tables() {

  const [selectedCompetition , setSelectedCompetition] = useState({
    id: 1,
    name: 'v75',
  });

  const handleCompetitionSelect = (id, name) => {
    setSelectedCompetition({ id, name });
  }

return (
  <div>
    <PaginatedLapTable 
    competitionId={selectedCompetition .id}
    competitionName={selectedCompetition .name}
    />
    <Preview onCompetitionSelect={handleCompetitionSelect} />
  </div>
);
} 