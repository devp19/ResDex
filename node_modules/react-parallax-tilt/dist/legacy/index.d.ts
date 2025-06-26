import * as react_jsx_runtime from 'react/jsx-runtime';
import { PureComponent } from 'react';

type DOMSupportedEvent = MouseEvent | React.MouseEvent | TouchEvent | React.TouchEvent | DeviceOrientationEvent;
type SupportedEvent = DOMSupportedEvent | CustomEvent<CustomEventType>;
type CustomEventType = 'autoreset' | 'initial' | 'propChange';

type GlareProps = {
    /**
     * Enables/disables the glare effect.
     */
    glareEnable?: boolean;
    /**
     * Maximum glare opacity (`0.5 = 50%, 1 = 100%`). Range: `0-1`
     */
    glareMaxOpacity?: number;
    /**
     * Sets the color of the glare effect.
     */
    glareColor?: string;
    /**
     * Sets the position of the glare effect.
     */
    glarePosition?: GlarePosition;
    /**
     * Reverses the glare direction.
     */
    glareReverse?: boolean;
    /**
     * Sets the border radius of the glare. Accepts any standard CSS border radius value.
     */
    glareBorderRadius?: string;
};
type GlarePosition = 'top' | 'right' | 'bottom' | 'left' | 'all';

type TiltProps = {
    /**
     * Enables/disables the tilt effect.
     */
    tiltEnable?: boolean;
    /**
     * Reverses the tilt direction.
     */
    tiltReverse?: boolean;
    /**
     * Initial tilt angle (in degrees) on the x-axis.
     */
    tiltAngleXInitial?: number;
    /**
     * Initial tilt angle (in degrees) on the y-axis.
     */
    tiltAngleYInitial?: number;
    /**
     * Maximum tilt rotation (in degrees) on the x-axis (range: `0°-90°`).
     */
    tiltMaxAngleX?: number;
    /**
     * Maximum tilt rotation (in degrees) on the y-axis (range: `0°-90°`).
     */
    tiltMaxAngleY?: number;
    /**
     * Enables tilt on a single axis only.
     */
    tiltAxis?: Axis;
    /**
     * Manual tilt rotation (in degrees) on the x-axis.
     */
    tiltAngleXManual?: number | null;
    /**
     * Manual tilt rotation (in degrees) on the y-axis.
     */
    tiltAngleYManual?: number | null;
};
type Axis = 'x' | 'y';

type OnMoveParams = {
    tiltAngleX: number;
    tiltAngleY: number;
    tiltAngleXPercentage: number;
    tiltAngleYPercentage: number;
    glareAngle: number;
    glareOpacity: number;
    event: SupportedEvent;
};
type OnMove = (onMoveParams: OnMoveParams) => void;
type OnEnterParams = {
    event: MouseEvent | React.MouseEvent | TouchEvent | React.TouchEvent;
};
type OnEnter = (onEnterParams: OnEnterParams) => void;
type OnLeaveParams = {
    event: MouseEvent | React.MouseEvent | TouchEvent | React.TouchEvent;
};
type OnLeave = (onLeaveParams: OnLeaveParams) => void;
type HtmlDivTilt = Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'>;
type ReactParallaxTiltProps = TiltProps & GlareProps & HtmlDivTilt & {
    /**
     * Tilt children component
     */
    children?: React.ReactNode;
    /**
     * Scale of the component (`1.5 = 150%, 2 = 200%`).
     */
    scale?: number;
    /**
     * Defines how far the tilt component appears from the user. Lower values create more extreme tilt effects.
     */
    perspective?: number;
    /**
     * Enables/disables vertical flipping of the component.
     */
    flipVertically?: boolean;
    /**
     * Enables/disables horizontal flipping of the component.
     */
    flipHorizontally?: boolean;
    /**
     * Determines if effects should reset on `onLeave` event.
     */
    reset?: boolean;
    /**
     * Easing function for the transition.
     */
    transitionEasing?: string;
    /**
     * Speed of the transition.
     */
    transitionSpeed?: number;
    /**
     * Tracks mouse and touch events across the entire window.
     */
    trackOnWindow?: boolean;
    /**
     * Enables/disables device orientation detection.
     */
    gyroscope?: boolean;
    /**
     * Callback triggered when user moves on the component.
     */
    onMove?: OnMove;
    /**
     * Callback triggered when user enters the component.
     */
    onEnter?: OnEnter;
    /**
     * Callback triggered when user leaves the component.
     */
    onLeave?: OnLeave;
};

declare class ReactParallaxTilt extends PureComponent<ReactParallaxTiltProps> {
    static defaultProps: ReactParallaxTiltProps;
    private wrapperEl;
    private tilt;
    private glare;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(): void;
    private addEventListeners;
    private addDeviceOrientationEventListener;
    private removeEventListeners;
    setSize: () => void;
    private setWrapperElSize;
    private initGlare;
    mainLoop: (event: SupportedEvent) => void;
    private onEnter;
    private onMove;
    private emitOnMove;
    private onLeave;
    private processInput;
    private processInputDeviceOrientation;
    private update;
    private updateClientInput;
    private updateFlip;
    renderFrame: () => void;
    private resetWrapperElTransform;
    private renderPerspective;
    private renderScale;
    private setTransitions;
    render(): react_jsx_runtime.JSX.Element;
}

export { ReactParallaxTilt as default };
export type { Axis, GlarePosition, GlareProps, OnEnter, OnEnterParams, OnLeave, OnLeaveParams, OnMove, OnMoveParams, ReactParallaxTiltProps, TiltProps };
