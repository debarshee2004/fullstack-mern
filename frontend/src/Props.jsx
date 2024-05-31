// The component which id sending the props.
export default function Profile() {
  return (
    <Avatar person={{ name: "Lin Lanying", imageId: "1bX5QH6" }} size={100} />
  );
}

// The component destructures the props when reciving.
function Avatar({ person, size }) {
  // person and size are available here
}

// The component which recives the whole props and then later destructures it.
function Avatar(props) {
  let personName = props.person.name;
  let personImageId = props.person.imageId;
  let size = props.size;
}
