import "./css/IsPromotedPopOut.css";

export function IsPromotedPopUp({promoted} : {promoted: (isPromoted : boolean) => void}) {
    return (
        <>
            <div className="promotion-overlay">
                    <div className="promotion-modal">
                        <div>成りますか？</div>
                        <div className="buttons">
                            <button
                                onClick={() => {
                                    promoted(true);
                                }}
                            >
                                成る
                            </button>
                            <button
                                onClick={() => {
                                    promoted(false);
                                }}
                            >
                                成らない
                            </button>
                        </div>
                    </div>
                </div>
        </>
    );
}


