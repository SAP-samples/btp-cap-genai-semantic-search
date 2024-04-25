import BaseController from "./BaseController";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import Popover from "sap/m/Popover";
import Table from "sap/m/Table";
import Fragment from "sap/ui/core/Fragment";
import JSONModel from "sap/ui/model/json/JSONModel";

interface SearchModel {
	searchResults: any[];
	isSearching: boolean;
	sQuery: string;
	sReformulationQuery: string;
	sSqlQuery?: string;
}

/**
 * @namespace com.sap.search.engine.controller
 */
export default class Main extends BaseController {
	private sQuery: string = "";
	private oModel: JSONModel;
	private _oPopover: Popover;
	private snippets: string[] = [];


	onInit(): void {
		const initialData: SearchModel = {
			searchResults: [],
			isSearching: false,
			sQuery: "",
			sReformulationQuery: ""
		};
		this.oModel = new JSONModel(initialData);
		this.getView().setModel(this.oModel);
	}

	public onExtraSearchStringChange(oEvent: any): void {
		const sAdjustSearchString = oEvent.getParameter("query");
		const oTable = this.getView().byId("searchResultsTable") as Table;

		if (sAdjustSearchString) {
			this.snippets.push(sAdjustSearchString);
		}

		oTable.setBusy(true);
		this.onSearch(oEvent);
	}

	private onResetSearch(_oEvent: any): void {
		this.oModel.setData({
			searchResults: [],
			sQuery: "",
			sReformulationQuery: "",
			isSearching: false,
		}, false);
		this.sQuery = "";
		this.snippets = [];
	}

	private async onSearch(oEvent: any): Promise<void> {
		const oTable = this.getView().byId("searchResultsTable") as Table;

		if (!this.sQuery) {
			this.sQuery = oEvent.getParameter("query");
			this.snippets.push(this.sQuery);
		}

		if (this.sQuery && this.sQuery.length > 0) {
			this.oModel.setProperty("/isSearching", true);

			try {
				const response = await fetch("/api/odata/v4/sample/search", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ snippets: this.snippets })
				});
		
				if (response.ok) {
					const data = await response.json();
					const aSearchResults = data.documents;
					let updatedSqlQuery = data.sqlQuery.replace(/\[.*?\]/, "'EMBEDDING'");

					this.oModel.setProperty("/sSqlQuery", updatedSqlQuery);
					this.oModel.setProperty("/searchResults", aSearchResults);

					this.oModel.setProperty("/sQuery", this.snippets.length > 1 ? data.reformulatedText : this.sQuery);

					if (aSearchResults.length === 0) { // No entries with the search prompt properties were found.
						MessageToast.show("No documents were found");
						this.onResetSearch(oEvent);
					}

					this.oModel.setProperty("/isSearching", false);
					oTable.setBusy(false);
					this.oModel.setProperty("/sReformulationQuery", "");
					console.log(aSearchResults);
				} else {
					throw new Error("Search failed with status: " + response.status);
				}
			} catch (error) {
				console.error(error);
				MessageBox.error(`Error: ${(error as Error).message}`, {
					title: "Search Error"
				});
				this.oModel.setProperty("/isSearching", false);
				oTable.setBusy(false);
			}

		}
	}

	public async onShowPopover(oEvent: any): Promise<void> {
		if (!this._oPopover) {
			this._oPopover = await Fragment.load({
				id: this.getView().getId(),
				name: "com.sap.search.engine.fragment.SqlQuery",
				controller: this
			}) as Popover;

			this.getView().addDependent(this._oPopover);
		}
		this._oPopover.openBy(oEvent.getSource());
	}
}
