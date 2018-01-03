import * as React from 'react';
import {Modal, Button, ButtonGroup} from 'react-bootstrap';
import {ThreeBounce} from 'better-react-spinkit';
import DefaultTooltip from 'shared/components/defaultTooltip/DefaultTooltip';
import {If} from 'react-if';
import fileDownload from 'react-file-download';
import {action, observable} from "mobx";
import {observer} from "mobx-react";
const Clipboard = require('clipboard');

import copyDownloadStyles from "./copyDownloadControls.module.scss";

export interface ICopyDownloadControlsProps {
    className?: string;
    showCopy?: boolean;
    copyButtonLabel?: string;
    showDownload?: boolean;
    downloadButtonLabel?: string;
    downloadData?: () => Promise<ICopyDownloadData>;
    downloadFilename?: string;
}

export interface ICopyDownloadData {
    status: 'complete'|'incomplete';
    text: string;
}

/**
 * @author Selcuk Onur Sumer
 * @author Aaron Lisman
 */
@observer
export class CopyDownloadControls extends React.Component<ICopyDownloadControlsProps, {}>
{
    @observable downloadingData = false;
    @observable copyingData = false;
    @observable showErrorMessage = false;

    private _copyButton: HTMLButtonElement|null = null;
    private _modalCopyButton: HTMLButtonElement|null = null;
    private _modalCopyButtonContainer: HTMLElement|null = null;

    private _copyText: string|null = null;

    public static defaultProps:ICopyDownloadControlsProps = {
        className: "",
        showCopy: true,
        showDownload: true,
        downloadFilename: "data.tsv"
    };

    constructor()
    {
        super();
        this.handleDownload = this.handleDownload.bind(this);
        this.handleCopy = this.handleCopy.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
    }

    componentDidMount() {
        // this is necessary because the clipboard wrapper library
        // doesn't work with tooltips :(
        if (this.props.showCopy) {
            this.bindCopyButton(this._copyButton);
        }
    }

    public bindCopyButton(button: HTMLButtonElement|null, container?: HTMLElement|null)
    {
        if (button) {
            new Clipboard(button, {
                text: this.getText.bind(this),
                // we need to pass a container to the clipboard when we use it in a Modal element
                // see https://stackoverflow.com/questions/38398070/bootstrap-modal-does-not-work-with-clipboard-js-on-firefox
                container: container
            });
        }
    }

    public render()
    {
        const arrowContent = <div className="rc-tooltip-arrow-inner"/>;

        return (
            <span>
                <ButtonGroup className={this.props.className} style={{ marginLeft:10 }}>
                    <If condition={this.props.showCopy}>
                        <DefaultTooltip
                            overlay={<span>Copy</span>}
                            placement="top"
                            mouseLeaveDelay={0}
                            mouseEnterDelay={0.5}
                            arrowContent={arrowContent}
                        >
                            <button
                                ref={(el:HTMLButtonElement) => {this._copyButton = el;}}
                                className="btn btn-sm btn-default"
                                data-clipboard-text="NA"
                                id="copyButton"
                                onClick={this.handleCopy}
                            >
                                {this.props.copyButtonLabel} <i className='fa fa-clipboard'/>
                            </button>
                        </DefaultTooltip>
                    </If>

                    <If condition={this.props.showDownload}>
                        <DefaultTooltip
                            overlay={<span>Download TSV</span>}
                            mouseLeaveDelay={0}
                            mouseEnterDelay={0.5}
                            placement="top"
                            arrowContent={arrowContent}
                        >
                            <Button className="btn-sm" onClick={this.handleDownload}>
                                {this.props.downloadButtonLabel} <i className='fa fa-cloud-download'/>
                            </Button>
                        </DefaultTooltip>
                    </If>
                </ButtonGroup>
                {this.downloadIndicatorModal()}
                {this.copyIndicatorModal()}
                {this.downloadErrorModal()}
            </span>
        );
    }

    public downloadIndicatorModal(): JSX.Element
    {
        return (
            <Modal
                show={this.downloadingData}
                onHide={() => undefined}
                bsSize="sm"
                className={`${copyDownloadStyles["centered-modal-dialog"]}`}
            >
                <Modal.Body>
                    <ThreeBounce style={{ display:'inline-block', marginRight:10 }} />
                    <span>Downloading Table Data...</span>
                </Modal.Body>
            </Modal>
        );
    }

    public copyIndicatorModal(): JSX.Element
    {
        return (
            <Modal
                show={this.copyingData}
                onHide={() => undefined}
                onEntered={() => {this.bindCopyButton(this._modalCopyButton, this._modalCopyButtonContainer);}}
                bsSize="sm"
                className={`${copyDownloadStyles["centered-modal-dialog"]}`}
            >
                <Modal.Header>
                    {this.showErrorMessage ? "Copy Error!" : "Copy Ready!"}
                </Modal.Header>
                <Modal.Body>
                    {this.showErrorMessage && "An error occurred while copying the data. Data may be incomplete."}
                    Please click on Copy to copy the data to clipboard.
                </Modal.Body>
                <Modal.Footer>
                    <span
                        ref={(el: HTMLElement|null) => {this._modalCopyButtonContainer = el;}}
                    >
                        <button
                            ref={(el:HTMLButtonElement) => {this._modalCopyButton = el;}}
                            onClick={this.handleModalClose}
                            className="btn btn-primary"
                            data-clipboard-text="NA"
                            id="modalCopyButton"
                        >
                            Copy
                        </button>
                    </span>
                </Modal.Footer>
            </Modal>
        );
    }

    public downloadErrorModal(): JSX.Element
    {
        return (
            <Modal
                show={!this.copyingData && this.showErrorMessage}
                onHide={this.handleModalClose}
                bsSize="sm"
                className={`${copyDownloadStyles["centered-modal-dialog"]}`}
            >
                <Modal.Header>
                    Download Error!
                </Modal.Header>
                <Modal.Body>
                    An error occurred while downloading the data. Downloaded file may contain incomplete data.
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={this.handleModalClose}
                        className="btn btn-primary"
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    public getText(): string
    {
        return this._copyText || "";
    }

    public handleCopy()
    {
        // async update of the copy text, if the copy text ends up to be different than the previous one,
        // we show a modal to force a second copy action.
        setTimeout(this.initCopyProcess(), 1);
    }

    public initCopyProcess()
    {
        // this makes sure that copy data and the download data are the same/consistent
        this.initDownloadProcess(text => {
            // do not update if the copy text is not updated since the last copy request
            // (also do not update the observable "copyingData" otherwise prompting unnecessary copy modal)
            if (this._copyText !== text) {
                this._copyText = text;
                this.copyingData = true;
            }
        });
    }

    public handleDownload()
    {
        this.initDownloadProcess(text => {
            // save the text so that we won't prompt it again for copy action
            this._copyText = text;

            // init file download
            this.download(text);
        });
    }

    public initDownloadProcess(callback: (text: string) => void)
    {
        if (this.props.downloadData) {
            // mark downloading data true, so that we can show a loading message
            this.downloadingData = true;

            this.props.downloadData().then(copyDownloadData => {
                if (copyDownloadData.status === "complete") {
                    // promise is resolved, we need to hide the download indicator
                    this.downloadingData = false;
                }
                else {
                    this.triggerDownloadError();
                }

                callback(copyDownloadData.text);
            }).catch(() => {
                this.triggerDownloadError();
            });
        }
    }

    public download(text: string)
    {
        fileDownload(text, this.props.downloadFilename);
    }

    @action
    private handleModalClose()
    {
        // need to set both flags to false,
        // in order to not show multiple modals in case of a download error during copy action
        this.copyingData = false;
        this.showErrorMessage = false;
    }

    @action
    private triggerDownloadError()
    {
        // promise is rejected: we need to hide the download indicator and show an error message
        this.downloadingData = false;
        this.showErrorMessage = true;
    }
}
