const TableHeader = () => {
    return (
        <thead>
            <tr>
                <th>Name</th>
                <th>Job</th>
            </tr>
        </thead>
    )
}

const TableBody = (props) => {
    const rows = props.characterData.map((row, index) => {
        return (
            <tr key={index}>
                <td>{row.name}</td>
                <td>{row.job}</td>
                <td>
                    <button onClick={() => {props.removeCharacter(index)}}>
                        Delete
                    </button>
                </td>
            </tr>
        )
    })

    return (
        // <tbody>
        //     <tr>
        //         <td>Charlie</td>
        //         <td>Janitor</td>
        //     </tr>
        //     <tr>
        //         <td>Mac</td>
        //         <td>Bouncer</td>
        //     </tr>
        //     <tr>
        //         <td>Dee</td>
        //         <td>Aspiring actress</td>
        //     </tr>
        //     <tr>
        //         <td>Dennis</td>
        //         <td>Bartender</td>
        //     </tr>
        // </tbody>
        <tbody>{rows}</tbody>
    )
}

// 값을 {}로 감싸서 받아야 본래 type대로 사용 가능
// 구조 분해 할당
function Table({characterData, removeCharacter}) {
    return (
        <table>
            <TableHeader/>
            <TableBody characterData={characterData} removeCharacter={removeCharacter}/>
        </table>
    );
}

export default Table;