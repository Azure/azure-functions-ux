export default interface ILogEvent {
  category: string; //Ex: 'localDevExperience'
  id: string; //Ex: 'FunctionCreateOptionChanged'
  data: any; //Ex: 'This is a more-details message' || { randomInfo: 2, randomInfo2: 'asd' }
}
