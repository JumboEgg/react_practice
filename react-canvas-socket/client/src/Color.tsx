
export interface colorProps {
    color: string,
    setColor: React.Dispatch<React.SetStateAction<string>>,
    setIsErasing: React.Dispatch<React.SetStateAction<boolean>>
}

function Color({
    color,
    setColor,
    setIsErasing
}: colorProps): JSX.Element {

    if (color === 'erase') {
        return (
            <div
                id='erase'
                className="color"
                onClick={() => {setIsErasing(true)}}
                style={{flex: 1, background: 'pink'}}
            ></div>
        )
    }
    return (
        <div
            id={color}
            className="color"
            onClick={() => {
                setColor(color)
                setIsErasing(false)
            }}
            style={{flex: 1, background: color}}
        ></div>
    )
}

export default Color;