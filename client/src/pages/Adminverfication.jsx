// import { useEffect, useState } from "react";
// import {
//   Container,
//   Card,
//   CardContent,
//   Typography,
//   Button,
//   Box,
// } from "@mui/material";
// import axios from "axios";

// export default function Adminverification() {
//   const [doctors, setDoctors] = useState([]);

//   // useEffect(() => {
//   //   axios
//   //     .get("http://localhost:3000/api/doctor")
//   //     .then((res) => setDoctors(res.data))
//   //     .catch((err) => console.error(err));
//   // }, []);

//   // const updateStatus = (id, status) => {
//   //   axios
//   //     .put(`http://localhost:3000/api/doctor/${id}`, { status })
//   //     .then(() => {
//   //       setDoctors((prev) =>
//   //         prev.map((doc) => (doc._id === id ? { ...doc, status } : doc))
//   //       );
//   //     })
//   //     .catch((err) => console.error(err));
//   // };

//   return (
//     <Container>
//       <Typography variant="h4" className="text-center my-4">
//         Admin Panel
//       </Typography>
//       {doctors.map((doc) => (
//         <Card key={doc._id} className="mb-4 shadow-lg">
//           <CardContent>
//             <Typography variant="h6">{doc.name}</Typography>
//             <Typography>Email: {doc.email}</Typography>
//             <Typography>License: {doc.license}</Typography>
//             <Typography>Status: {doc.status}</Typography>
//             <Box className="mt-4">
//               <Button
//                 variant="contained"
//                 color="success"
//                 onClick={() => updateStatus(doc._id, "verified")}
//                 className="mr-2"
//               >
//                 Approve
//               </Button>
//               <Button
//                 variant="contained"
//                 color="error"
//                 onClick={() => updateStatus(doc._id, "rejected")}
//               >
//                 Reject
//               </Button>
//             </Box>
//           </CardContent>
//         </Card>
//       ))}
//     </Container>
//   );
// }
