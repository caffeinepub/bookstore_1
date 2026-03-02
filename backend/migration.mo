import AccessControl "authorization/access-control";

module {
  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
