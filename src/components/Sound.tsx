import { Project } from "../types";

export const Sound = (props: Project) => {
    const { fileType, fileName, id } = props;

    return (
        <div className="flex flex-col justify-center items-center p-4 w-full">
            <h1 className="text-xl">{id}</h1>
            <audio 
                className="
                    w-full md:w-1/2
                    [&::-webkit-media-controls-panel]:bg-white 
                    [&::-webkit-media-controls-current-time-display]:text-black 
                    [&::-webkit-media-controls-time-remaining-display]:text-black
                    [&::-webkit-media-controls-timeline]:text-black
                    [&::-webkit-media-controls-play-button]:text-black
                    [&::-webkit-media-controls-volume-slider]:text-black
                    [&::-webkit-media-controls-mute-button]:text-black
                    [&::-webkit-media-controls-timeline-container]:text-black
                    [&::-webkit-media-controls-volume-slider-container]:text-black
                "
                src={`/${fileName}`} 
                controls 
            />
        </div>
    )
}