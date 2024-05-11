// import React, { useEffect, useState } from "react"

// const Draggable: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [isDragging, setIsDragging] = useState(false)
//   const [position, setPosition] = useState({ x: 0, y: 0 })
//   const [origin, setOrigin] = useState({ x: 0, y: 0 })

//   const handleMouseDown = (e) => {
//     setOrigin({
//       x: e.clientX - position.x,
//       y: e.clientY - position.y
//     })
//     setIsDragging(true)
//   }

//   const handleMouseUp = () => {
//     setIsDragging(false)
//   }

//   const handleMouseMove = (e) => {
//     if (isDragging) {
//       setPosition({
//         x: e.clientX - origin.x,
//         y: e.clientY - origin.y
//       })
//     }
//   }

//   useEffect(() => {
//     if (isDragging) {
//       window.addEventListener("mousemove", handleMouseMove)
//       window.addEventListener("mouseup", handleMouseUp)
//     } else {
//       window.removeEventListener("mousemove", handleMouseMove)
//       window.removeEventListener("mouseup", handleMouseUp)
//     }

//     return () => {
//       window.removeEventListener("mousemove", handleMouseMove)
//       window.removeEventListener("mouseup", handleMouseUp)
//     }
//   }, [isDragging, handleMouseMove, handleMouseUp])

//   return (
//     <div
//       style={{
//         position: "absolute",
//         left: `${position.x}px`,
//         top: `${position.y}px`,
//         border: "1px solid black",
//         padding: "10px",
//         cursor: "move"
//       }}
//       onMouseDown={handleMouseDown}></div>
//   )
// }

// export default Draggable
