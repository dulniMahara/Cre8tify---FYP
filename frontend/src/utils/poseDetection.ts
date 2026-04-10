import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';

// Initialize the detector
export const createDetector = async () => {
    await tf.ready();
    const model = poseDetection.SupportedModels.MoveNet;
    const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
    };
    return poseDetection.createDetector(model, detectorConfig);
};

// Function to get the specific "Fitting" coordinates
export const getBodyKeypoints = async (imageElement: HTMLImageElement) => {
    const detector = await createDetector();
    const poses = await detector.estimatePoses(imageElement);

    if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        
        // We extract the critical points for T-shirt placement
        const leftShoulder = keypoints.find(k => k.name === 'left_shoulder');
        const rightShoulder = keypoints.find(k => k.name === 'right_shoulder');
        const leftHip = keypoints.find(k => k.name === 'left_hip');
        const rightHip = keypoints.find(k => k.name === 'right_hip');

        return {
            leftShoulder,
            rightShoulder,
            leftHip,
            rightHip,
            midChest: {
                x: ((leftShoulder?.x || 0) + (rightShoulder?.x || 0)) / 2,
                y: ((leftShoulder?.y || 0) + (rightShoulder?.y || 0)) / 2 + 20 // Slightly below shoulder line
            },
            shoulderWidth: Math.abs((leftShoulder?.x || 0) - (rightShoulder?.x || 0))
        };
    }
    return null;
};