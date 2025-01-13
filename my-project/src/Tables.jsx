import React, { useState } from 'react'; 
import PaginatedLapTable from "./Components/PaginatedLapTable";
import Preview from "./Preview";

export default function Tables() {
  const [selectedCompetionId, setSelectedCompetitionId] = useState(null);

  const handleCompetitionSelect = (id) => {
    setSelectedCompetitionId(id);
  }

return (
  <div>
    <PaginatedLapTable competitionId={selectedCompetionId}/>
    <Preview onCompetitionSelect={handleCompetitionSelect} />
  </div>
);
} 